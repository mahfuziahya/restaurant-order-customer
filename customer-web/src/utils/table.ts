export const getTableIdFromUrl = (): number | null => {
  const params = new URLSearchParams(window.location.search);

  const table = params.get("table");

  if (!table) {
    return null;
  }

  const tableId = Number(table);

  if (!Number.isInteger(tableId) || tableId <= 0) {
    return null;
  }

  return tableId;
};
