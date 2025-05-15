export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString();
};

export const formatDateTime = (dateTimeString: string | undefined): string => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return dateTimeString;
  }
};