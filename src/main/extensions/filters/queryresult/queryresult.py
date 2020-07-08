#!/usr/bin/env python
# -*- mode: Python; coding: utf-8 -*-

import sys
from xml.sax.saxutils import escape
from xml.sax.saxutils import unescape

def out_entries(entries,simpara,html_mode):
  buff = []
  if html_mode:
    buff.append('<tr>')
    for entry in entries:
      buff.append('<td align="left" valign="top">')
      if simpara:
        buff.append('<p><code class="literal">')
      buff.append(entry.strip())
      if simpara:
        buff.append('</code></p>')
      buff.append('</td>')
    buff.append('</tr>')
  else:
    buff.append('<row>')
    for entry in entries:
      buff.append('<entry align="left" valign="top">')
      if simpara:
        buff.append('<simpara><literal>')
      buff.append(entry.strip())
      if simpara:
        buff.append('</literal></simpara>')
      buff.append('</entry>')
    buff.append('</row>')
  return buff

def split_line(line):
  line = unescape(line)
  if not hasattr(split_line, 'positions'):
    split_line.positions = []
    left = 2
    right = -1
    for part in line[1:-2].split('|'):
      right += len(part) + 1
      split_line.positions.append( {'left':left, 'right':right} )
      left = right + 3
  strings = []
  for position in split_line.positions:
    strings.append(escape(line[position['left']:position['right']]))
  return strings

def table_header(title, headings, info_lines, html_mode):
  if (headings):
    column_count = len(headings)
  else:
    column_count = 1
  if headings and len(headings[0]) == 0:
    sys.exit("The first table heading is empty.")
  buff = []
  if html_mode:
    buff.append('<table class="queryresult" border="1" cellspacing="0" cellpadding="0">')
    if title:
      buff.append('<caption>' + title + '</caption>')
  else:
    if title:
      buff.append('<table tabstyle="queryresult table" role="NotInToc" frame="none" rowsep="1" colsep="1">')
      buff.append('<title>' + title + '</title>')
    else:
      buff.append('<informaltable tabstyle="queryresult table" frame="none" rowsep="1" colsep="1">')
    buff.append('<tgroup cols="')
    buff.append(str(column_count))
    buff.append('">')
    for i in range(1, column_count + 1):
      buff.append('<colspec colname="col')
      buff.append(str(i))
      buff.append('"/>')
  if (headings):
    buff.append('<thead>')
    buff.extend(out_entries(headings, 0, html_mode))
    buff.append('</thead>')
  if (len(info_lines) > 0):
    buff.append('<tfoot>')
    for line in info_lines:
      if html_mode:
        buff.append('<tr><th align="left" valign="top" colspan="')
        buff.append(str(column_count))
        buff.append('">')
        buff.append(line)
        buff.append('</th></tr>')
      else:
        buff.append('<row><entry align="left" valign="top" namest="col1" nameend="col')
        buff.append(str(column_count))
        buff.append('">')
        buff.append(line)
        buff.append('</entry></row>')
    buff.append('</tfoot>')
  return buff


data = sys.stdin.readlines()
data.pop(0)
line = data.pop(0)
if line.startswith('| No data returned.') or line.startswith('| No data returned, and nothing was changed. |' ):
  first_line = False
  column_count = 1
else:
  first_line = split_line(line)
  column_count = len(first_line)
data.pop(0)
query_title = False
html_mode = False
if len(sys.argv) > 1:
  if sys.argv[1] == "--html":
    html_mode = True
  else:
    # only use the title for docbook outputs as it's already handled by AsciiDoc in the html case.
    if len(sys.argv) > 2:
      query_title = sys.argv[2]
body = []
info_lines = []

body.append('<tbody>')
data_plus = len(data) > 0 and data[0][0] == '+'
if first_line == False or data_plus:
  if data_plus:
    data.pop(0)

  if html_mode:
    body.append('<tr><td class="emptyresult" align="left" valign="top" colspan="')
    body.append(str(column_count))
    body.append('"><p><code class="literal">')
    body.append('(empty result)')
    body.append('</code></p></td></tr>')
  else:
    body.append('<row><entry role="emptyresult" align="left" valign="top" namest="col1" nameend="col')
    body.append(str(column_count))
    body.append('"><simpara><literal>')
    body.append('(empty result)')
    body.append('</literal></simpara></entry></row>')

for line in data:
  if line[0] == '|':
    body.extend(out_entries(split_line(line), 1, html_mode))
  elif line[0] != '+':
    info_lines.append(line)

body.append('</tbody>')

sys.stdout.write(''.join(table_header(query_title, first_line, info_lines, html_mode)))
sys.stdout.write(''.join(body))

if html_mode:
  sys.stdout.write('</table>')
else:
  sys.stdout.write('</tgroup>')
  if query_title:
    sys.stdout.write('</table>')
  else:
    sys.stdout.write('</informaltable>')
