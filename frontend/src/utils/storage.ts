export const storeTokens = (tokens: { access: string; refresh?: string }) => {
  localStorage.setItem("access", tokens.access);
  if (tokens.refresh) localStorage.setItem("refresh", tokens.refresh);
};

export const removeTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};
