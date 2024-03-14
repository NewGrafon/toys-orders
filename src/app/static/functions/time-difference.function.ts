export function timeDifference(
  createDate: number | string | Date,
  currentDatetime: number,
): string {
  let result: string = '';

  if (Number(createDate) === new Date(Number(createDate)).getTime()) {
    createDate = new Date(Number.parseInt(createDate.toString()));
  } else {
    createDate = new Date(createDate);
  }

  const diffMs = createDate.getTime() - currentDatetime; // milliseconds between now & Christmas
  const diffDays = Math.floor(diffMs / 86400000) * -1 - 1; // days
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000) * -1 - 1; // hours
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000) * -1; // minutes

  if (diffDays > 0) {
    result += `${diffDays} дней, `;
  }
  if (diffHrs > 0) {
    result += `${diffHrs} часов, `;
  }
  result += `${diffMins} минут назад`;

  return result;
}
