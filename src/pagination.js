// Number of shown items on the current page, if no limit then total items.
const currentItems = (total, start, limit) => {
    if (isNaN(start) || isNaN(limit)) {
        return total;
    }
    return Math.min(total - start + 1, limit);
};

// Number of total pages, if no limit then 1.
const numberOfPages = (total, start, limit) => {
    if (isNaN(start) || isNaN(limit)) {
        return 1;
    }
    return Math.ceil(total / limit);
};

// Calculates the page you're on, if no limit then 1.
const currentPage = (total, start, limit) => {
    if (isNaN(start) || isNaN(limit)) {
        return 1;
    }
    return Math.ceil(start / limit);
};

// The first item in the first page =1.
const firstPageItem = () => {
    return 1
};

// Calculated the first item on the last page.
const lastPageItem = (total, start, limit) => {
    if (isNaN(start) || isNaN(limit) || limit <= 0) {
        return total;
    }
    const lastPage = Math.ceil(total / limit);
    return (lastPage - 1) * limit + 1;
};

// Calculates the first item on the previous page.
const previousPageItem = (total, start, limit) => {
    return Math.max(1, start - limit);
};

// Calculates the first item on the next page.
const nextPageItem = (total, start, limit) => {
    return Math.min(total, start + limit);
};

// Generates a query for the first page.
const getFirstQueryString = (total, start, limit) => {
    return isNaN(start) || isNaN(limit) ? "" : `?start=${firstPageItem()}&limit=${limit}`;
};

// Generates a query for the last page.
const getLastQueryString = (total, start, limit) => {
    return isNaN(start) || isNaN(limit) ? "" : `?start=${lastPageItem(total, start, limit)}&limit=${limit}`;
};

// Generates a query for the previous page.
const getPreviousQueryString = (total, start, limit) => {
    return isNaN(start) || isNaN(limit) || start <= 1 ? "" : `?start=${previousPageItem(total, start, limit)}&limit=${limit}`;
};

// Generates a query for the next page.
const getNextQueryString = (total, start, limit) => {
    return isNaN(start) || isNaN(limit) || currentPage(total, start, limit) >= numberOfPages(total, start, limit) ? "" : `?start=${nextPageItem(total, start, limit)}&limit=${limit}`;
};

// Calculates what pagenumber belongs to itemNumber.
// export const itemToPageNumber = (total, start, limit, itemNumber) => {
//     if (isNaN(start) || isNaN(limit) || itemNumber < start || itemNumber > start + limit - 1) {
//         return 1;
//     }
//     return Math.ceil(itemNumber / limit);
// };

// Create pagination object
export const createPagination = (total, start, limit) => {
    console.log("Start createPagination")
    const currentPageNum = currentPage(total, start, limit);

    return {
        items: [],
        _links: {
            self: {
                href: `http://145.24.222.190:8000/tasks?start=${start}&limit=${limit}`,
            },
        },
        pagination: {
            currentPage: currentPageNum,
            currentItems: currentItems(total, start, limit),
            totalPages: numberOfPages(total, start, limit),
            totalItems: total,
            _links: {
                first: {
                    page: 1,
                    href: `http://145.24.222.190:8000/tasks${getFirstQueryString(total, start, limit)}`,
                },
                last: {
                    page: numberOfPages(total, start, limit),
                    href: `http://145.24.222.190:8000/tasks${getLastQueryString(total, start, limit)}`,
                },
                previous: {
                    page: currentPageNum > 1 ? currentPageNum - 1 : 1,
                    href: `http://145.24.222.190:8000/tasks${getPreviousQueryString(total, start, limit)}`,
                },
                next: {
                    page: currentPageNum < numberOfPages(total, start, limit) ? currentPageNum + 1 : currentPageNum,
                    href: `http://145.24.222.190:8000/tasks${getNextQueryString(total, start, limit)}`,
                },
            },
        },
    };
};