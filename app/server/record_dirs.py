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


def direct_file_condition(dir_path, alias='r'):
    """返回 (sql_cond, params)：仅匹配「直接位于 dir_path 的文件」。

    根目录：无 '/' 的文件，外加 _attachment/ 下的文件（保持平铺、不生成文件夹）。
    """
    sn = _sn(alias)
    d = normalize_dir(dir_path)
    if not d:
        return ("(%s NOT LIKE '%%/%%' OR %s LIKE '%s%%')" % (sn, sn, _ATTACH_PREFIX), [])
    like = _like_escape(d)
    return ("(%s LIKE ? ESCAPE '\\' AND %s NOT LIKE ? ESCAPE '\\')" % (sn, sn),
            [like + '/%', like + '/%/%'])


def under_dir_condition(dir_path, alias='r'):
    """返回 (sql_cond, params)：匹配 dir_path 之下（含更深层）的所有记录。"""
    sn = _sn(alias)
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

    rows: [(stored_name, file_size)]，需已限定在 dir_path 之下。
    返回 (folders, direct_count)：
      folders      —— [{'name','path','file_count','size'}]，按名称排序；
      direct_count —— 直接位于 dir_path 的文件数。
    """
    d = normalize_dir(dir_path)
    prefix = (d + '/') if d else ''
    agg = {}
    direct = 0
    for sn, fs in rows:
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
                a = {'files': 0, 'size': 0}
                agg[seg] = a
            a['files'] += 1
            a['size'] += int(fs or 0)
        else:
            direct += 1
    folders = [{
        'name': name,
        'path': (d + '/' + name) if d else name,
        'file_count': v['files'],
        'size': v['size'],
    } for name, v in agg.items()]
    folders.sort(key=lambda x: x['name'].lower())
    return folders, direct


def query_dir_view(conn, base_where, base_params, dir_path):
    """执行目录聚合查询，返回 (folders, direct_count)。

    base_where / base_params 为记录范围（如管理员全站为空、普通用户限自己的链接）。
    """
    cond, cparams = under_dir_condition(dir_path)
    sql = "SELECT %s AS sn, r.file_size AS fs FROM upload_records r %s" % (
        _sn('r'), combine_where(base_where, cond))
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
