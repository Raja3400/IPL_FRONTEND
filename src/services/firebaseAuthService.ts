import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
  type User
} from "firebase/auth";
import { getFirebaseAuthInstance } from "../lib/firebase";

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

function getAuth() {
  return getFirebaseAuthInstance();
}

function ensureRecaptcha(containerId: string) {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  recaptchaVerifier = new RecaptchaVerifier(getAuth(), containerId, {
    size: "invisible"
  });

  return recaptchaVerifier;
}

export const firebaseAuthService = {
  prepareRecaptcha(containerId: string) {
    ensureRecaptcha(containerId);
  },
  async sendOtp(phoneNumber: string, containerId: string) {
    const verifier = ensureRecaptcha(containerId);
    confirmationResult = await signInWithPhoneNumber(getAuth(), phoneNumber, verifier);
  },
  async verifyOtp(code: string): Promise<User> {
    if (!confirmationResult) {
      throw new Error("OTP has not been requested yet");
    }

    const result = await confirmationResult.confirm(code);
    return result.user;
  },
  async getFirebaseIdToken(user?: User) {
    const currentUser = user ?? getAuth().currentUser;
    if (!currentUser) {
      throw new Error("Firebase user is not available");
    }

    return currentUser.getIdToken(true);
  },
  async signOut() {
    confirmationResult = null;
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
    await signOut(getAuth());
  }
};
