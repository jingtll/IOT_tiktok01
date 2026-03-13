export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*'],
      exclude: /node_modules/i,
      selectorBlackList: ['no-rem', 'header.not-login'],
      // 或者：忽略 height 属性的转换（所有 height 的 px 都不转）
      // propBlackList: ['height']
    },
  },
};
