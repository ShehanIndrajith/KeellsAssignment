using Microsoft.Data.SqlClient;
using KeellsBackend.Data;
using KeellsBackend.Models;
using KeellsBackend.Repositories.Interfaces;

namespace KeellsBackend.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly SqlConnectionFactory _connectionFactory;

        public EmployeeRepository(SqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            var employees = new List<Employee>();

            const string sql = @"SELECT e.EmployeeId, e.FirstName, e.LastName, e.Email,
                            e.DateOfBirth, e.Salary, e.DepartmentId,
                            e.CreatedAt, e.ModifiedAt, e.IsActive,
                            d.DepartmentName, d.DepartmentCode
                     FROM Employees e
                     INNER JOIN Departments d ON e.DepartmentId = d.DepartmentId
                     WHERE e.IsActive = 1
                     ORDER BY e.EmployeeId";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
                employees.Add(MapFromReader(reader));

            return employees;
        }

        public async Task<Employee?> GetByIdAsync(int id)
        {
            const string sql = @"SELECT e.EmployeeId, e.FirstName, e.LastName, e.Email,
                            e.DateOfBirth, e.Salary, e.DepartmentId,
                            e.CreatedAt, e.ModifiedAt, e.IsActive,
                            d.DepartmentName, d.DepartmentCode
                     FROM Employees e
                     INNER JOIN Departments d ON e.DepartmentId = d.DepartmentId
                     WHERE e.EmployeeId = @Id AND e.IsActive = 1";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
                return MapFromReader(reader);

            return null;
        }

        public async Task<bool> EmailExistsAsync(string email, int? excludeId = null)
        {
            const string sql = @"SELECT COUNT(1) FROM Employees 
                     WHERE Email = @Email AND IsActive = 1
                     AND (@ExcludeId IS NULL OR EmployeeId != @ExcludeId)";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Email", email);
            cmd.Parameters.AddWithValue("@ExcludeId", excludeId.HasValue ? excludeId.Value : DBNull.Value);

            int count = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            return count > 0;
        }

        public async Task<int> CreateAsync(Employee employee)
        {
            const string sql = @"INSERT INTO Employees (FirstName, LastName, Email, DateOfBirth, Salary, DepartmentId, CreatedAt, ModifiedAt, IsActive)
                     VALUES (@FirstName, @LastName, @Email, @DateOfBirth, @Salary, @DepartmentId, GETDATE(), NULL, 1);
                     SELECT CAST(SCOPE_IDENTITY() AS INT)";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@FirstName", employee.FirstName);
            cmd.Parameters.AddWithValue("@LastName", employee.LastName);
            cmd.Parameters.AddWithValue("@Email", employee.Email);
            cmd.Parameters.AddWithValue("@DateOfBirth", employee.DateOfBirth);
            cmd.Parameters.AddWithValue("@Salary", employee.Salary);
            cmd.Parameters.AddWithValue("@DepartmentId", employee.DepartmentId);

            object? result = await cmd.ExecuteScalarAsync();
            return result != null ? Convert.ToInt32(result) : 0;
        }

        public async Task<bool> UpdateAsync(Employee employee)
        {
            const string sql = @"UPDATE Employees
                         SET FirstName    = @FirstName,
                             LastName     = @LastName,
                             Email        = @Email,
                             DateOfBirth  = @DateOfBirth,
                             Salary       = @Salary,
                             DepartmentId = @DepartmentId,
                             ModifiedAt   = GETDATE()
                         WHERE EmployeeId = @EmployeeId";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@FirstName", employee.FirstName);
            cmd.Parameters.AddWithValue("@LastName", employee.LastName);
            cmd.Parameters.AddWithValue("@Email", employee.Email);
            cmd.Parameters.AddWithValue("@DateOfBirth", employee.DateOfBirth);
            cmd.Parameters.AddWithValue("@Salary", employee.Salary);
            cmd.Parameters.AddWithValue("@DepartmentId", employee.DepartmentId);
            cmd.Parameters.AddWithValue("@EmployeeId", employee.EmployeeId);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = @"UPDATE Employees 
                         SET IsActive   = 0,
                             ModifiedAt = GETDATE()
                         WHERE EmployeeId = @Id";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        private static Employee MapFromReader(SqlDataReader reader) => new()
        {
            EmployeeId = reader.GetInt32(reader.GetOrdinal("EmployeeId")),
            FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
            LastName = reader.GetString(reader.GetOrdinal("LastName")),
            Email = reader.GetString(reader.GetOrdinal("Email")),
            DateOfBirth = reader.GetDateTime(reader.GetOrdinal("DateOfBirth")),
            Salary = reader.GetDecimal(reader.GetOrdinal("Salary")),
            DepartmentId = reader.GetInt32(reader.GetOrdinal("DepartmentId")),
            DepartmentName = reader.GetString(reader.GetOrdinal("DepartmentName")),
            DepartmentCode = reader.GetString(reader.GetOrdinal("DepartmentCode")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            ModifiedAt = reader.IsDBNull(reader.GetOrdinal("ModifiedAt"))
                     ? null
                     : reader.GetDateTime(reader.GetOrdinal("ModifiedAt")),
            IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive"))
        };
    }
}