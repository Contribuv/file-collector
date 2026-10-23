# -*- coding: utf-8 -*-
"""上传记录「目录视图」辅助函数。

记录页需要以「文件管理器」的方式逐层浏览：根目录列出子文件夹与散落文件，
点进某个文件夹后再列出该目录的子文件夹与文件。

为兼容分页，目录聚合放在服务端完成：给定记录范围（管理员全站 / 普通用户
自己的链接 / 某个收集链接）与「当前目录」，本模块提供

  * direct_file_condition()  —— 「直接位于当前目录的文件」的过滤条件；
  * query_dir_view()         —— 当前目录下各子文件夹的文件数 / 合计大小；
  * breadcrumb()             —— 面包屑路径。

约定：stored_name 为相对上传目录的路径，分隔符统一按 '/' 处理（反斜杠在
SQL 与 Python 两端都被规整为 '/'）。
"""

_ATTACH_PREFIX = '_attachment/'


def normalize_dir(value):
    """规范化目录路径：统一分隔符、去掉首尾与多余斜杠、过滤 . 与 ..。"""
    s = str(value or '').replace('\\', '/')
    parts = [p for p in s.split('/') if p and p not in ('.', '..')]
    return '/'.join(parts)


def _sn(alias='r'):
    """SQL 片段：把 stored_name 规整为 '/' 分隔（反斜杠转正斜杠、空值转空串）。"""
    return "replace(ifnull(%s.stored_name,''), '\\', '/')" % alias


def _like_escape(s):
    """转义 LIKE 通配符，配合 ESCAPE '\\' 使用。"""
    return s.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')


def _sql_lit(s):
    """把字符串包成 SQL 字面量（单引号翻倍转义）。"""
    return "'" + str(s).replace("'", "''") + "'"


# 存储口径的两种历史形态：
#   * 在线上传：文件存于 <链接>/<姓名>/ 下，stored_name 是相对姓名目录的路径（无前缀）；
#   * 迁移 / 扫描回填：stored_name 是相对链接目录的路径，带 '<姓名>/' 前缀。
# 两套口径并存曾导致列表里出现/缺少「姓名」文件夹的混乱。以下两个表达式把
# 它们分别按「上传者自视角」与「链接根视角」归一，所有界面共用同一口径。

def display_path_expr(sanitized_uploader, alias='r'):
    """「上传者自视角」显示路径表达式：剥掉旧口径的 '<姓名>/' 前缀层。

    适用于已把记录范围限定到某上传者的查询（收集页 / 分享页按上传者浏览）：
      * 旧口径 '<姓名>/a.txt' → 'a.txt'；
      * 新口径 'a.txt'        → 'a.txt'（原样，本来就相对姓名目录）。
    sanitized_uploader 必须是调用方按目录名规则清洗过的姓名（与物理目录名
    一致）；返回的 SQL 表达式不含占位符参数，姓名为空时返回 None（不归一）。
    """
    name = str(sanitized_uploader or '').strip()
    if not name:
        return None
    sn = _sn(alias)
    return ("(CASE WHEN %s LIKE %s ESCAPE '\\' "
            "THEN substr(%s, %d) ELSE %s END)"
            % (sn, _sql_lit(_like_escape(name) + '/%'), sn, len(name) + 2, sn))


def norm_path_expr(alias='r'):
    """「链接根视角」统一规范路径表达式：映射为 '<姓名>/<路径>'。

    适用于不限单一上传者的查询（管理员后台 / 分享页全链浏览）：
      * 旧口径（首段即本人的 '<姓名>/…'）      → 原样；
      * 新口径（无前缀，物理存于姓名目录下）    → 前面补 '<姓名>/'；
      * uploader_name 为空 / '_attachment'、
        附件路径（_attachment/…）或空 stored_name → 原样（平铺为散文件）。
    LIKE 转义在 SQL 内按行值完成，不引入占位符。
    """
    up = "replace(ifnull(%s.uploader_name,''), '\\', '/')" % alias
    sn = _sn(alias)
    upesc = ("replace(replace(replace(" + up
             + ", " + _sql_lit('\\') + ", " + _sql_lit('\\\\')
             + "), " + _sql_lit('%') + ", " + _sql_lit('\\%')
             + "), " + _sql_lit('_') + ", " + _sql_lit('\\_') + ")")
    base = ("(%s NOT IN ('', '_attachment') AND %s != '' AND %s NOT LIKE %s)"
            % (up, sn, sn, _sql_lit(_ATTACH_PREFIX + '%')))
    return ("(CASE WHEN %s THEN (CASE WHEN %s LIKE %s || '/%%' ESCAPE '\\' "
            "THEN %s ELSE %s || '/' || %s END) ELSE %s END)"
            % (base, sn, upesc, sn, up, sn, sn))


def direct_file_condition(dir_path, sn_expr=None, alias='r'):
    """返回 (sql_cond, params)：仅匹配「直接位于 dir_path 的文件」。

    根目录：无 '/' 的文件，外加 _attachment/ 下的文件（保持平铺、不生成文件夹）。
    sn_expr 可传入自定义的路径口径表达式（如 display_path_expr /
    norm_path_expr 的返回值）；缺省为 stored_name 本身。
    """
    sn = sn_expr if sn_expr is not None else _sn(alias)
    d = normalize_dir(dir_path)
    if not d:
        return ("(%s NOT LIKE '%%/%%' OR %s LIKE '%s%%')" % (sn, sn, _ATTACH_PREFIX), [])
    like = _like_escape(d)
    return ("(%s LIKE ? ESCAPE '\\' AND %s NOT LIKE ? ESCAPE '\\')" % (sn, sn),
            [like + '/%', like + '/%/%'])


def under_dir_condition(dir_path, sn_expr=None, alias='r'):
    """返回 (sql_cond, params)：匹配 dir_path 之下（含更深层）的所有记录。"""
    sn = sn_expr if sn_expr is not None else _sn(alias)
    d = normalize_dir(dir_path)
    if not d:
        return ('', [])
    return ("%s LIKE ? ESCAPE '\\'" % sn, [_like_escape(d) + '/%'])


def combine_where(base_where, cond):
    """把已存在的 WHERE 子句与新的条件用 AND 组合。"""
    if not cond:
        return base_where or ''
    if base_where:
        return base_where + ' AND ' + cond
    return 'WHERE ' + cond


def aggregate_folders(rows, dir_path):
    """聚合当前目录的直接子文件夹。

    rows: [(stored_name, file_size, uploaded_at)]，需已限定在 dir_path 之下。
    返回 (folders, direct_count)：
      folders      —— [{'name','path','file_count','size','latest'}]，按名称排序；
                      latest 为该文件夹内最新一条记录的上传时间（可与文件
                      uploaded_at 交错排序用）；目录为空或时间缺失时取 ''
      direct_count —— 直接位于 dir_path 的文件数。
    """
    d = normalize_dir(dir_path)
    prefix = (d + '/') if d else ''
    agg = {}
    direct = 0
    for row in rows:
        sn, fs = row[0], row[1]
        t = str(row[2]) if len(row) > 2 and row[2] else ''
        s = str(sn or '').replace('\\', '/').strip('/')
        if not s:
            if not d:
                direct += 1
            continue
        if prefix and not s.startswith(prefix):
            continue
        rest = s[len(prefix):] if prefix else s
        if not rest:
            continue
        if s.startswith(_ATTACH_PREFIX):
            # 附件目录不生成文件夹分组，根目录下按散文件处理
            if not d:
                direct += 1
            continue
        if '/' in rest:
            seg = rest.split('/', 1)[0]
            a = agg.get(seg)
            if a is None:
                a = {'files': 0, 'size': 0, 'latest': ''}
                agg[seg] = a
            a['files'] += 1
            a['size'] += int(fs or 0)
            if t > a['latest']:
                a['latest'] = t
        else:
            direct += 1
    folders = [{
        'name': name,
        'path': (d + '/' + name) if d else name,
        'file_count': v['files'],
        'size': v['size'],
        'latest': v['latest'],
    } for name, v in agg.items()]
    folders.sort(key=lambda x: x['name'].lower())
    return folders, direct


def query_dir_view(conn, base_where, base_params, dir_path, sn_expr=None):
    """执行目录聚合查询，返回 (folders, direct_count)。

    base_where / base_params 为记录范围（如管理员全站为空、普通用户限自己的链接）。
    sn_expr 为自定义路径口径表达式（缺省为 stored_name 本身）。
    """
    cond, cparams = under_dir_condition(dir_path, sn_expr=sn_expr)
    sql = "SELECT %s AS sn, r.file_size AS fs, r.uploaded_at AS ua FROM upload_records r %s" % (
        sn_expr if sn_expr is not None else _sn('r'), combine_where(base_where, cond))
    rows = conn.execute(sql, tuple(base_params) + tuple(cparams)).fetchall()
    return aggregate_folders(rows, dir_path)


def breadcrumb(dir_path):
    """返回由根到当前目录的面包屑：[{'name','path'}]。"""
    d = normalize_dir(dir_path)
    if not d:
        return []
    out = []
    acc = ''
    for p in d.split('/'):
        acc = (acc + '/' + p) if acc else p
        out.append({'name': p, 'path': acc})
    return out
