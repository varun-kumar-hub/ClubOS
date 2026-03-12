const paginate = (query, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { from: offset, to: offset + limit - 1 };
};

const paginationMeta = (total, page, limit) => ({
  total,
  page: parseInt(page),
  limit: parseInt(limit),
  totalPages: Math.ceil(total / limit)
});

module.exports = { paginate, paginationMeta };
