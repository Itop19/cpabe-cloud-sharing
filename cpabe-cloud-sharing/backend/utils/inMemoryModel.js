function createInMemoryModel(name, schema) {
  const store = [];
  let counter = 1;

  function clone(item) {
    return typeof item === 'object' && item !== null ? JSON.parse(JSON.stringify(item)) : item;
  }

  function matches(item, query) {
    if (!query || typeof query !== 'object' || Array.isArray(query)) {
      return true;
    }

    if (query.$or) {
      return query.$or.some((condition) => matches(item, condition));
    }

    return Object.entries(query).every(([key, expected]) => {
      if (expected === undefined) return true;
      if (typeof expected === 'object' && expected !== null && !Array.isArray(expected)) {
        return item[key] !== undefined && item[key] === expected;
      }
      return item[key] === expected;
    });
  }

  function create(data) {
    const record = {
      _id: String(counter++),
      ...clone(data),
      createdAt: data.createdAt || new Date().toISOString()
    };
    store.push(record);
    return Promise.resolve(record);
  }

  function find(query = {}) {
    const results = store.filter((item) => matches(item, query));
    const queryResult = {
      data: results,
      sort(criteria) {
        const entries = [...this.data];
        const [field, direction] = Object.entries(criteria || {})[0] || [];
        if (!field) return entries;
        entries.sort((a, b) => {
          const left = a[field] || '';
          const right = b[field] || '';
          return direction === -1 ? (left > right ? -1 : 1) : (left < right ? -1 : 1);
        });
        this.data = entries;
        return entries;
      },
      populate() {
        return this.data;
      }
    };
    return Promise.resolve(queryResult.data);
  }

  function findOne(query = {}) {
    const item = store.find((entry) => matches(entry, query));
    if (!item) return Promise.resolve(null);
    return Promise.resolve(item);
  }

  function findById(id) {
    const item = store.find((entry) => entry._id === String(id) || entry._id === id);
    if (!item) return Promise.resolve(null);
    return Promise.resolve(item);
  }

  function findByIdAndUpdate(id, update, options = {}) {
    const target = store.find((entry) => entry._id === String(id) || entry._id === id);
    if (!target) return Promise.resolve(null);
    const updated = { ...target, ...clone(update) };
    const index = store.indexOf(target);
    store[index] = updated;
    return Promise.resolve(options.new !== false ? updated : target);
  }

  function findByIdAndDelete(id) {
    const index = store.findIndex((entry) => entry._id === String(id) || entry._id === id);
    if (index === -1) return Promise.resolve(null);
    const [removed] = store.splice(index, 1);
    return Promise.resolve(removed);
  }

  return {
    name,
    schema,
    create,
    find,
    findOne,
    findById,
    findByIdAndUpdate,
    findByIdAndDelete,
    __store: store
  };
}

module.exports = { createInMemoryModel };
