export function gameRequestHref(contact: string, name: string, reference?: string) {
  const subject = encodeURIComponent(`Board game request: ${name}`);
  const body = encodeURIComponent(`Game: ${name}\nOfficial publisher link:\nEdition (if known):\n${reference ? `Identity reference: ${reference}\n` : ''}`);
  return `mailto:${contact}?subject=${subject}&body=${body}`;
}
