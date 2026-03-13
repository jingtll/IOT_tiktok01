/**
 * 数字格式化，将大数字转为万/亿单位
 * @param {number} num - 要格式化的数字
 * @returns {string} 格式化后的字符串
 */
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else {
    return num.toString()
  }
}
