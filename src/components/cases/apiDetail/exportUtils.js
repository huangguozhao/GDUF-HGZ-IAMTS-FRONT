import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { ElMessage } from 'element-plus'

export const exportToExcel = (data, fileName) => {
  if (!data || data.length === 0) {
    ElMessage.warning('没有数据可以导出')
    return
  }
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '测试历史')

  const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }))
  worksheet['!cols'] = colWidths

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, fileName)
}

export const exportToJson = (data, fileName) => {
  if (!data) data = []
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  saveAs(blob, fileName)
}

export const exportToCsv = (data, fileName) => {
  if (!data || data.length === 0) {
    ElMessage.warning('没有数据可以导出')
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header] || ''
        if (value.toString().includes(',') || value.toString().includes('"')) {
          return `"${value.toString().replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, fileName)
}

export default {
  exportToExcel,
  exportToJson,
  exportToCsv
}


