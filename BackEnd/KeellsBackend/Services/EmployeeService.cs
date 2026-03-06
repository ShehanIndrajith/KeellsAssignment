using KeellsBackend.DTOs;
using KeellsBackend.Helpers;
using KeellsBackend.Models;
using KeellsBackend.Repositories.Interfaces;
using KeellsBackend.Services.Interfaces;

namespace KeellsBackend.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;

        public EmployeeService(IEmployeeRepository employeeRepository)
        {
            _employeeRepository = employeeRepository;
        }

        public async Task<IEnumerable<EmployeeResponseDto>> GetAllEmployeesAsync()
        {
            var employees = await _employeeRepository.GetAllAsync();
            return employees.Select(MapToResponseDto);
        }

        public async Task<EmployeeResponseDto?> GetEmployeeByIdAsync(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            return employee == null ? null : MapToResponseDto(employee);
        }

        public async Task<(bool Success, string Message, EmployeeResponseDto? Data)> CreateEmployeeAsync(EmployeeCreateDto dto)
        {
            // Email format validation
            if (!EmailValidator.IsValid(dto.Email))
                return (false, "Invalid email format.", null);

            // Email uniqueness check
            if (await _employeeRepository.EmailExistsAsync(dto.Email))
                return (false, "Email already exists.", null);

            // Age validation — must be at least 18
            int age = AgeCalculator.Calculate(dto.DateOfBirth);
            if (age < 18)
                return (false, "Employee must be at least 18 years old.", null);

            var employee = new Employee
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = dto.Email.Trim().ToLower(),
                DateOfBirth = dto.DateOfBirth,
                Salary = dto.Salary,
                DepartmentId = dto.DepartmentId
            };

            int newId = await _employeeRepository.CreateAsync(employee);
            employee.EmployeeId = newId;

            var created = await _employeeRepository.GetByIdAsync(newId);
            return (true, "Employee created successfully.", created == null ? null : MapToResponseDto(created));
        }

        public async Task<(bool Success, string Message)> UpdateEmployeeAsync(EmployeeUpdateDto dto)
        {
            var existing = await _employeeRepository.GetByIdAsync(dto.EmployeeId);
            if (existing == null)
                return (false, "Employee not found.");

            if (!EmailValidator.IsValid(dto.Email))
                return (false, "Invalid email format.");

            if (await _employeeRepository.EmailExistsAsync(dto.Email, dto.EmployeeId))
                return (false, "Email already exists.");

            int age = AgeCalculator.Calculate(dto.DateOfBirth);
            if (age < 18)
                return (false, "Employee must be at least 18 years old.");

            existing.FirstName = dto.FirstName.Trim();
            existing.LastName = dto.LastName.Trim();
            existing.Email = dto.Email.Trim().ToLower();
            existing.DateOfBirth = dto.DateOfBirth;
            existing.Salary = dto.Salary;
            existing.DepartmentId = dto.DepartmentId;

            bool updated = await _employeeRepository.UpdateAsync(existing);
            return updated ? (true, "Employee updated successfully.") : (false, "Update failed.");
        }

        public async Task<(bool Success, string Message)> DeleteEmployeeAsync(int id)
        {
            var existing = await _employeeRepository.GetByIdAsync(id);
            if (existing == null)
                return (false, "Employee not found.");

            bool deleted = await _employeeRepository.DeleteAsync(id);
            return deleted ? (true, "Employee deleted successfully.") : (false, "Delete failed.");
        }

        private static EmployeeResponseDto MapToResponseDto(Employee e) => new()
        {
            EmployeeId = e.EmployeeId,
            FirstName = e.FirstName,
            LastName = e.LastName,
            Email = e.Email,
            DateOfBirth = e.DateOfBirth,
            Age = AgeCalculator.Calculate(e.DateOfBirth),
            Salary = e.Salary,
            DepartmentId = e.DepartmentId,
            DepartmentName = e.DepartmentName,
            DepartmentCode = e.DepartmentCode
        };
    }
}