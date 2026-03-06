using KeellsBackend.DTOs;

namespace KeellsBackend.Services.Interfaces
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeResponseDto>> GetAllEmployeesAsync();
        Task<EmployeeResponseDto?> GetEmployeeByIdAsync(int id);
        Task<(bool Success, string Message, EmployeeResponseDto? Data)> CreateEmployeeAsync(EmployeeCreateDto dto);
        Task<(bool Success, string Message)> UpdateEmployeeAsync(EmployeeUpdateDto dto);
        Task<(bool Success, string Message)> DeleteEmployeeAsync(int id);
    }
}