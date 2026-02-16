import { CompetitionStatus } from '../constants/enums/CompetitionEnums';
  
const getCompetitionStatusColor = (status) => {
  switch (status) {
    case CompetitionStatus.PLANNED:
      return 'default';
    case CompetitionStatus.IN_PREPARATION:
      return 'info';
    case CompetitionStatus.OPEN:
      return 'info';
    case CompetitionStatus.ONGOING:
      return 'warning';
    case CompetitionStatus.COMPLETED:
      return 'success';
    case CompetitionStatus.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
}

export { getCompetitionStatusColor };