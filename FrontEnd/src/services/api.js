const BASE_URL = 'https://localhost:44381/api';

const request = async (url, options = {}) => {
    try {
        const res = await fetch(`${BASE_URL}${url}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.message, data }; // ← pass data back on error too
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Department API
export const departmentApi = {
    getAll:     ()     => request('/Department'),
    getById:    (id)   => request(`/Department/${id}`),
    create:     (body) => request('/Department', { method: 'POST', body: JSON.stringify(body) }),
    update:     (body) => request('/Department', { method: 'PUT',  body: JSON.stringify(body) }),
    delete:     (id)   => request(`/Department/${id}`, { method: 'DELETE' }),
    reactivate: (id, body) => request(`/Department/reactivate/${id}`, { method: 'POST', body: JSON.stringify(body) }),
};
// Employee API
export const employeeApi = {
  getAll: () => request('/employee'),
  getById: (id) => request(`/employee/${id}`),
  create: (body) => request('/employee', { method: 'POST', body: JSON.stringify(body) }),
  update: (body) => request('/employee', { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/employee/${id}`, { method: 'DELETE' }),
};