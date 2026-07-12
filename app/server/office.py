"""
Office 文档预览模块
- DOCX/XLSX/PPTX/CSV：基于 OnlyOffice WASM 纯前端渲染
- 静态资源目录：app/server/office/
路由 /doc — 预览容器（权限校验 + 重定向到 viewer）
路由 /office-v/<path:filename> — 静态资源服务（viewer 入口 + assets）
路由 /<prefix>/<path:filename> — OnlyOffice 内部绝对路径资源映射
"""
import os
from urllib.parse import quote
from flask import Blueprint, request, abort, session, redirect, send_from_directory

office_bp = Blueprint('office_doc_preview', __name__)

# OnlyOffice 静态资源目录
_OFFICE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'office')

# 支持的 Office 扩展名
OFFICE_EXTS = {'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'}

# OnlyOffice 内部用绝对路径加载的子目录前缀
# （viewer 页面在 /office-v/ 下，但 WASM/SDK/web-apps 等用 /wasm/ /sdkjs/ 等根路径请求）
_OFFICE_PREFIXES = ('wasm', 'sdkjs', 'web-apps', 'fonts', 'img', 'ran-fonts',
                    'ranui-iife', 'convert', 'open', 'libs', 'zh-CN')


@office_bp.route('/office-v/<path:filename>')
def office_static(filename):
    """OnlyOffice viewer 静态资源服务

    index.html 需要携带合法的 src 参数才能访问（防止预览入口泄露），
    预览入口必须通过 /doc 路由（含权限校验）重定向进入。
    其他静态资源（JS/CSS/字体/WASM 等）正常服务。
    """
    if filename == 'index.html' or filename == '':
        # 检查 src 参数是否合法（必须指向 collect/share/admin 的 preview_file）
        src = request.args.get('src', '')
        allowed_prefixes = ('/collect/', '/share/', '/admin/records/')
        if not src or not any(src.startswith(p) for p in allowed_prefixes):
            abort(403)
        # 后台预览 URL 需要登录，未登录时跳转到后台登录页
        if src.startswith('/admin/records/') and not session.get('user_id'):
            return redirect('/admin/login')
    return send_from_directory(_OFFICE_DIR, filename)


# OnlyOffice 内部用绝对路径加载资源（/wasm/x2t.wasm.gz、/sdkjs/...、/web-apps/... 等）
# 为每个子目录前缀注册独立路由，避免 catch-all 与其他 Blueprint 路由冲突
def _make_root_static(subdir):
    def _serve(filename):
        full_path = os.path.join(_OFFICE_DIR, subdir, filename)
        if not os.path.isfile(full_path):
            abort(404)
        # .gz / .wasm 需要正确的 MIME 类型
        if filename.endswith('.gz'):
            mimetype = 'application/wasm'
        elif filename.endswith('.wasm'):
            mimetype = 'application/wasm'
        elif filename.endswith('.js'):
            mimetype = 'application/javascript'
        elif filename.endswith('.css'):
            mimetype = 'text/css'
        elif filename.endswith('.json'):
            mimetype = 'application/json'
        elif filename.endswith('.ttf'):
            mimetype = 'font/ttf'
        elif filename.endswith('.woff2'):
            mimetype = 'font/woff2'
        elif filename.endswith('.svg'):
            mimetype = 'image/svg+xml'
        else:
            mimetype = 'application/octet-stream'
        directory = os.path.dirname(full_path)
        basename = os.path.basename(full_path)
        return send_from_directory(directory, basename, mimetype=mimetype)
    _serve.__name__ = f'office_root_{subdir.replace("-", "_")}'
    return _serve

for _prefix in _OFFICE_PREFIXES:
    office_bp.route(f'/{_prefix}/<path:filename>')(_make_root_static(_prefix))


@office_bp.route('/doc')
def doc_preview():
    """Office 文档预览容器（DOCX/XLSX/PPTX/CSV）

    参数与 /office 一致，复用相同权限校验逻辑。
    权限失败时返回 _render_error_html 友好错误页（与 PDF 预览体验一致）。
    """
    # 延迟导入，避免循环依赖
    from app import _render_error_html, _check_record_ownership

    type_param = request.args.get('type', '')
    lid = request.args.get('lid', '')
    rid = request.args.get('rid', '')
    token = request.args.get('tk', '')
    expires = request.args.get('ex', '')
    filename = request.args.get('fn', '')
    if not filename:
        filename = request.args.get('filename', '')
    if not filename:
        filename = '文档预览'

    # ===== 后台权限校验（第一层） =====
    if type_param == 'a':
        if not session.get('user_id'):
            return redirect('/admin/login')
        try:
            rid_int = int(rid) if rid else 0
        except (ValueError, TypeError):
            return _render_error_html('请求参数无效', 400, '记录ID格式不正确，请从预览按钮进入')
        if rid_int:
            if not _check_record_ownership(rid_int):
                return _render_error_html('无权访问此文件', 403, '您只能预览自己创建的收集链接中的文件')

    # ===== 构造文件内容 URL（复用 /office 路由逻辑） =====
    token_qs = f'?token={token}&expires={expires}' if token else ''

    if type_param == 'c' and lid and rid:
        file_url = f'/collect/{lid}/preview_file/{rid}{token_qs}'
    elif type_param == 's' and lid and rid:
        file_url = f'/share/{lid}/preview_file/{rid}{token_qs}'
    elif type_param == 'a' and rid:
        file_url = f'/admin/records/{rid}/preview_file'
    elif type_param == 'ca' and lid:
        file_url = f'/collect/{lid}/attachment/preview{token_qs}'
    else:
        return _render_error_html('请求参数无效', 400, '缺少必要的参数，请从预览按钮进入')

    # 重定向到 OnlyOffice viewer，只读模式 + 中文界面
    encoded_file = quote(file_url, safe='')
    encoded_fn = quote(filename, safe='')
    return redirect(f'/office-v/index.html?src={encoded_file}&readonly=true&locale=zh&fn={encoded_fn}')
