using KeellsBackend.DTOs;
using KeellsBackend.Helpers;
using KeellsBackend.Models;
using KeellsBackend.Repositories.Interfaces;
using KeellsBackend.Services.Interfaces;

namespace KeellsBackend.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _departmentRepository;

        public DepartmentService(IDepartmentRepository departmentRepository)
        {
            _departmentRepository = departmentRepository;
        }

        public async Task<IEnumerable<DepartmentResponseDto>> GetAllDepartmentsAsync()
        {
            var departments = await _departmentRepository.GetAllAsync();
            return departments.Select(MapToResponseDto);
        }

        public async Task<DepartmentResponseDto?> GetDepartmentByIdAsync(int id)
        {
            var department = await _departmentRepository.GetByIdAsync(id);
            return department == null ? null : MapToResponseDto(department);
        }

        public async Task<(bool Success, string Message, DepartmentResponseDto? Data, DepartmentInactiveFoundDto? InactiveFound)> CreateDepartmentAsync(DepartmentCreateDto dto)
        {
            string code = dto.DepartmentCode.Trim().ToUpper();
            string name = dto.DepartmentName.Trim();

            // Check if active duplicate exists
            if (await _departmentRepository.DepartmentCodeExistsAsync(code))
                return (false, "Department code already exists.", null, null);

            if (await _departmentRepository.DepartmentNameExistsAsync(name))
                return (false, "Department name already exists.", null, null);

            // Check if inactive duplicate exists by code or name
            var inactiveByCode = await _departmentRepository.GetInactiveByCodeAsync(code);
            var inactiveByName = await _departmentRepository.GetInactiveByNameAsync(name);
            var inactive = inactiveByCode ?? inactiveByName;

            if (inactive != null)
            {
                // Tell frontend an inactive record was found — ask to confirm reactivation
                return (false, $"'{inactive.DepartmentName}' ({inactive.DepartmentCode}) exists but is inactive. Would you like to reactivate it?", null,
                    new DepartmentInactiveFoundDto
                    {
                        DepartmentId = inactive.DepartmentId,
                        DepartmentCode = inactive.DepartmentCode,
                        DepartmentName = inactive.DepartmentName
                    });
            }

            // Create fresh
            var department = new Department
            {
                DepartmentCode = code,
                DepartmentName = name
            };

            int newId = await _departmentRepository.CreateAsync(department);
            department.DepartmentId = newId;

            return (true, "Department created successfully.", MapToResponseDto(department), null);
        }

        public async Task<(bool Success, string Message, DepartmentResponseDto? Data)> ReactivateDepartmentAsync(int id, DepartmentCreateDto dto)
        {
            bool reactivated = await _departmentRepository.ReactivateAsync(id, dto.DepartmentCode.Trim().ToUpper(), dto.DepartmentName.Trim());

            if (!reactivated)
                return (false, "Reactivation failed.", null);

            var updated = await _departmentRepository.GetByIdAsync(id);
            return (true, "Department reactivated successfully.", updated == null ? null : MapToResponseDto(updated));
        }

        public async Task<(bool Success, string Message)> UpdateDepartmentAsync(DepartmentUpdateDto dto)
        {
            var existing = await _departmentRepository.GetByIdAsync(dto.DepartmentId);
            if (existing == null)
                return (false, "Department not found.");

            if (await _departmentRepository.DepartmentNameExistsAsync(dto.DepartmentName, dto.DepartmentId))
                return (false, "Department name already exists.");

            existing.DepartmentName = dto.DepartmentName.Trim();

            bool updated = await _departmentRepository.UpdateAsync(existing);
            return updated ? (true, "Department updated successfully.") : (false, "Update failed.");
        }

        public async Task<(bool Success, string Message)> DeleteDepartmentAsync(int id)
        {
            var existing = await _departmentRepository.GetByIdAsync(id);
            if (existing == null)
                return (false, "Department not found.");

            int empCount = await _departmentRepository.GetActiveEmployeeCountAsync(id);
            if (empCount > 0)
                return (false, $"Cannot delete '{existing.DepartmentName}'. It has {empCount} active employee(s). Please reassign or remove them first.");

            bool deleted = await _departmentRepository.DeleteAsync(id);
            return deleted ? (true, "Department deleted successfully.") : (false, "Delete failed.");
        }

        private static DepartmentResponseDto MapToResponseDto(Department d) => new()
        {
            DepartmentId = d.DepartmentId,
            DepartmentCode = d.DepartmentCode,
            DepartmentName = d.DepartmentName
        };
    }
}