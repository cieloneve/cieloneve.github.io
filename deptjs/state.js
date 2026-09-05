export const LIMITS = Object.freeze({
  minPeople: 2,
  maxPeople: 50,
  scale: 100,
  minAmount: 1,
  maxAmount: 10000000000,
  maxNameLength: 40,
  maxRandomDebts: 200,
  defaultTimeoutMs: 1000,
  maxTimeoutMs: 5000,
  maxNodes: 1000000
});

export const DEFAULT_SETTINGS = Object.freeze({
  timeoutMs: LIMITS.defaultTimeoutMs,
  maxNodes: LIMITS.maxNodes
});

export const state = {
  people: [],
  debts: [],
  selectedAlgorithm: "greedy",
  settings: { ...DEFAULT_SETTINGS },
  result: null,
  worker: null,
  currentStep: 1,
  splitExpense: {
    payerId: null,
    selectedIds: [],
    total: ""
  }
};

export function setPeople(names) {
  state.people = names.map((name, id) => ({ id, name }));
  state.debts = [];
  state.result = null;
  state.splitExpense = {
    payerId: state.people[0]?.id ?? null,
    selectedIds: state.people.map(person => person.id),
    total: ""
  };
}

export function getPersonName(id) {
  return state.people.find(person => person.id === id)?.name ?? `#${id}`;
}
