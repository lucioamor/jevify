declare function generateObject(x: unknown): Promise<any>;
declare function saveContact(id: string, phone: string): Promise<void>;

// The phone number already appears in the message; the model only has to find the right one.
export async function capturePhone(id: string, message: string) {
  const r = await generateObject({ prompt: `Return the customer's mobile number from this message: ${message}` });
  await saveContact(id, r.object.phone);
}
