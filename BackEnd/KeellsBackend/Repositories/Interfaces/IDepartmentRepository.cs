using KeellsBackend.Models;

namespace KeellsBackend.Repositories.Interfaces
{
        public interface IDepartmentRepository
        {
            Task<IEnumerable<Department>> GetAllAsync();
            Task<Department?> GetByIdAsync(int id);
            Task<int> GetLastDepartmentIdAsync();
            Task<bool> DepartmentCodeExistsAsync(string code, int? excludeId = null);
            Task<bool> DepartmentNameExistsAsync(string name, int? excludeId = null);
            Task<int> GetActiveEmployeeCountAsync(int id);
            Task<int> CreateAsync(Department department);
            Task<bool> UpdateAsync(Department department);
            Task<bool> DeleteAsync(int id);
            Task<Department?> GetInactiveByCodeAsync(string code);
            Task<Department?> GetInactiveByNameAsync(string name);
            Task<bool> ReactivateAsync(int id, string code, string name);
    }
}
