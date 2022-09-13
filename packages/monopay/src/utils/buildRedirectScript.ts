export const buildRedirectScript = (method: 'GET' | 'POST', url: string, params: Record<string, any> = {}): string => {
  let script = `var form = document.createElement("form");form.setAttribute("method", "${method}");form.setAttribute("action", "${url}");form.setAttribute("target", "_self");`;
  Object.keys(params).forEach((key) => {
    const value = params[key];
    script += `var monopay_hidden_field__${key} = document.createElement("input");monopay_hidden_field__${key}.setAttribute("name", ${key});monopay_hidden_field__${key}.setAttribute("value", ${value});form.appendChild(monopay_hidden_field__${key});`;
  });

  script += `document.body.appendChild(form);form.submit();document.body.removeChild(form);`;
  return script;
};
