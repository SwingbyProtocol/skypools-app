export const formatQuoteError = (message: string) => {
  try {
    const fullMsg = message.substring(message.indexOf(': ') + 1);
    const jsonStr = fullMsg.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
      return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
    });
    return JSON.parse(jsonStr).message;
  } catch (error) {
    return 'No routes found';
  }
};
