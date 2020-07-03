export function convertDateToUTC(date) {
    const month = date.getMonth();
    const dateOfMonth = date.getDate();
    const year = date.getFullYear();
    return new Date(Date.UTC(year, month, dateOfMonth));
}

export function convertDateToUTCMonth(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    return new Date(Date.UTC(year, month));
}
