using KeellsBackend.DTOs;

namespace KeellsBackend.Services.Interfaces
{
    public interface IDepartmentService
    {
        Task<(bool Success, string Message, DepartmentResponseDto? Data, DepartmentInactiveFoundDto? InactiveFound)> CreateDepartmentAsync(DepartmentCreateDto dto);
        Task<(bool Success, string Message, DepartmentResponseDto? Data)> ReactivateDepartmentAsync(int id, DepartmentCreateDto dto);
        Task<(bool Success, string Message)> UpdateDepartmentAsync(DepartmentUpdateDto dto);
        Task<(bool Success, string Message)> DeleteDepartmentAsync(int id);
        Task<IEnumerable<DepartmentResponseDto>> GetAllDepartmentsAsync();
        Task<DepartmentResponseDto?> GetDepartmentByIdAsync(int id);
    }
}