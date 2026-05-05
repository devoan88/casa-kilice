export type CasaBankDetails = {
  iban: string;
  beneficiary: string;
  bankName: string;
  swift: string;
  referenceHint: string;
};

export function getCasaBankDetails(): CasaBankDetails {
  return {
    iban: process.env.CK_BANK_IBAN?.trim() ?? "",
    beneficiary: process.env.CK_BANK_BENEFICIARY?.trim() ?? "Casa Kilicé",
    bankName: process.env.CK_BANK_NAME?.trim() ?? "",
    swift: process.env.CK_BANK_SWIFT?.trim() ?? "",
    referenceHint:
      process.env.CK_BANK_REFERENCE_HINT?.trim() ??
      "Use your order reference in the transfer narrative so we can match payment.",
  };
}
