export function unwrapApiPayload(response) {
  const body = response?.data;

  if (body?.comingSoon) {
    return {
      comingSoon: true,
      service: body.service,
      message: body.message,
      success: false,
    };
  }

  return body?.data ?? body;
}

export function isComingSoonPayload(payload) {
  return Boolean(payload?.comingSoon);
}
