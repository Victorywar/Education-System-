export const validateRegister = (form) => {
  const errors = {};

  if (!form.name?.trim()) errors.name = 'Full Name is required.';
  if (!form.age && form.age !== 0) errors.age = 'Age is required.';
  else if (isNaN(Number(form.age)) || Number(form.age) < 5 || Number(form.age) > 25) {
    errors.age = 'Enter a valid age (5-25).';
  }
  if (!form.className?.trim()) errors.className = 'Class is required.';
  if (!form.school?.trim()) errors.school = 'School is required.';
  if (!form.location?.trim()) errors.location = 'Location is required.';
  if (!form.language?.trim()) errors.language = 'Preferred Language is required.';
  if (!form.guardianContact?.trim()) errors.guardianContact = 'Parent/Guardian Contact is required.';
  if (!form.username?.trim()) errors.username = 'Username is required.';
  else if (form.username.trim().length < 3) errors.username = 'Username must be at least 3 characters.';
  if (!form.password) errors.password = 'Password is required.';
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (!form.confirmPassword) errors.confirmPassword = 'Confirm Password is required.';
  else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};

export const validateLogin = (form) => {
  const errors = {};
  if (!form.username?.trim()) errors.username = 'Username is required.';
  if (!form.password) errors.password = 'Password is required.';
  return errors;
};

export const getAuthErrorMessage = (err) => {
  const status = err.response?.status;
  const message = err.response?.data?.message;

  if (status === 401) return message || 'Invalid username or password.';
  if (status === 409) return message || 'Username already exists.';
  if (status === 400) return message || 'Please check your details and try again.';
  if (status === 500) return 'Something went wrong. Please try again.';
  return message || 'Something went wrong. Please try again.';
};
