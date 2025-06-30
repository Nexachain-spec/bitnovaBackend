
export const generateReferralCode = () => {
  const namePart = "ZENTOR";
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${namePart}${randomDigits}`;
};
export const randomUsername = () => {
  const characters = "0123456789";
  let result = "";
  const length = 10;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return `1TRADE${result}`;
};

export const generateRandomTxResponse = () => {
  const randomPrefix = ["TX", "TXN", "TRX", "T-RX"];
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const randomString =
    randomPrefix[Math.floor(Math.random() * randomPrefix.length)];

  const txResponse = `${randomString}-${randomSuffix}-${Date.now()}`;

  if (!txResponse) {
    console.error("Generated txResponse is invalid:", txResponse);
    return "defaultTxResponse";
  }
  return txResponse;
};