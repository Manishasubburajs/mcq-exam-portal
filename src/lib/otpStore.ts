type OTPRecord = {
  otp: string;
  expires: number;
  verified?: boolean;
};

// create global container
const globalForOtp = global as unknown as {
  otpStore: Record<string, OTPRecord>;
};

// reuse or initialize
export const otpStore =
  globalForOtp.otpStore || (globalForOtp.otpStore = {});