
export const queryKeys = {
  user: {
    me: ['user', 'me'],
  },
  goals: {
    all: ['goals'],
    list: (filters) => ['goals', 'list', filters],
    details: (id) => ['goals', 'detail', id],
  },
  business: {
    state: ['business', 'state'],
    metrics: ['business', 'metrics'],
  }
};
