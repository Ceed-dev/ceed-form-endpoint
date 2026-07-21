const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSubmission(body) {
  const errors = [];

  const company = typeof body.company === "string" ? body.company.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!company) errors.push("company is required");
  if (!name) errors.push("name is required");
  if (!email || !EMAIL_RE.test(email)) errors.push("email is invalid");
  if (company.length > 200) errors.push("company is too long");
  if (name.length > 200) errors.push("name is too long");
  if (phone.length > 50) errors.push("phone is too long");

  return {
    valid: errors.length === 0,
    errors,
    data: { company, name, email, phone },
  };
}
