using Microsoft.Data.SqlClient;
using KeellsBackend.Data;
using KeellsBackend.Models;
using KeellsBackend.Repositories.Interfaces;

namespace KeellsBackend.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly SqlConnectionFactory _connectionFactory;

        public DepartmentRepository(SqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<IEnumerable<Department>> GetAllAsync()
        {
            var departments = new List<Department>();
            const string sql = @"SELECT DepartmentId, DepartmentCode, DepartmentName, CreatedAt, ModifiedAt, IsActive
                     FROM Departments 
                     WHERE IsActive = 1
                     ORDER BY DepartmentId";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                departments.Add(MapFromReader(reader));
            }

            return departments;
        }

        public async Task<Department?> GetByIdAsync(int id)
        {
            const string sql = @"SELECT DepartmentId, DepartmentCode, DepartmentName, CreatedAt, ModifiedAt, IsActive
                     FROM Departments 
                     WHERE DepartmentId = @Id AND IsActive = 1";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
                return MapFromReader(reader);

            return null;
        }

        public async Task<int> GetLastDepartmentIdAsync()
        {
            const string sql = "SELECT ISNULL(MAX(DepartmentId), 0) FROM Departments";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            object? result = await cmd.ExecuteScalarAsync();

            return result != null ? Convert.ToInt32(result) : 0;
        }

        public async Task<bool> DepartmentCodeExistsAsync(string code, int? excludeId = null)
        {
            const string sql = @"SELECT COUNT(1) FROM Departments 
                     WHERE DepartmentCode = @Code 
                     AND IsActive = 1
                     AND (@ExcludeId IS NULL OR DepartmentId != @ExcludeId)";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Code", code);
            cmd.Parameters.AddWithValue("@ExcludeId", excludeId.HasValue ? excludeId.Value : DBNull.Value);

            int count = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            return count > 0;
        }

        public async Task<bool> DepartmentNameExistsAsync(string name, int? excludeId = null)
        {
            const string sql = @"SELECT COUNT(1) FROM Departments 
                     WHERE DepartmentName = @Name 
                     AND IsActive = 1
                     AND (@ExcludeId IS NULL OR DepartmentId != @ExcludeId)";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Name", name);
            cmd.Parameters.AddWithValue("@ExcludeId", excludeId.HasValue ? excludeId.Value : DBNull.Value);

            int count = Convert.ToInt32(await cmd.ExecuteScalarAsync());
            return count > 0;
        }

        public async Task<int> GetActiveEmployeeCountAsync(int id)
        {
            const string sql = "SELECT COUNT(1) FROM Employees WHERE DepartmentId = @Id AND IsActive = 1";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            return Convert.ToInt32(await cmd.ExecuteScalarAsync());
        }

        public async Task<int> CreateAsync(Department department)
        {
            const string sql = @"INSERT INTO Departments (DepartmentCode, DepartmentName, CreatedAt, ModifiedAt, IsActive)
                     VALUES (@DepartmentCode, @DepartmentName, GETDATE(), NULL, 1);
                     SELECT CAST(SCOPE_IDENTITY() AS INT)";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@DepartmentCode", department.DepartmentCode);
            cmd.Parameters.AddWithValue("@DepartmentName", department.DepartmentName);

            object? result = await cmd.ExecuteScalarAsync();
            return result != null ? Convert.ToInt32(result) : 0;
        }

        public async Task<bool> UpdateAsync(Department department)
        {
            const string sql = @"UPDATE Departments
                         SET DepartmentCode = @DepartmentCode,
                             DepartmentName = @DepartmentName,
                             ModifiedAt     = GETDATE()
                         WHERE DepartmentId = @DepartmentId";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@DepartmentCode", department.DepartmentCode);
            cmd.Parameters.AddWithValue("@DepartmentName", department.DepartmentName);
            cmd.Parameters.AddWithValue("@DepartmentId", department.DepartmentId);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = @"UPDATE Departments 
                         SET IsActive   = 0,
                             ModifiedAt = GETDATE()
                         WHERE DepartmentId = @Id";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<Department?> GetInactiveByCodeAsync(string code)
        {
            const string sql = @"SELECT DepartmentId, DepartmentCode, DepartmentName, CreatedAt, ModifiedAt, IsActive
                         FROM Departments 
                         WHERE DepartmentCode = @Code AND IsActive = 0";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Code", code);

            using SqlDataReader reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
                return MapFromReader(reader);

            return null;
        }

        public async Task<Department?> GetInactiveByNameAsync(string name)
        {
            const string sql = @"SELECT DepartmentId, DepartmentCode, DepartmentName, CreatedAt, ModifiedAt, IsActive
                         FROM Departments 
                         WHERE DepartmentName = @Name AND IsActive = 0";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Name", name);

            using SqlDataReader reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
                return MapFromReader(reader);

            return null;
        }

        public async Task<bool> ReactivateAsync(int id, string code, string name)
        {
            const string sql = @"UPDATE Departments 
                         SET IsActive       = 1,
                             DepartmentCode = @Code,
                             DepartmentName = @Name,
                             ModifiedAt     = GETDATE()
                         WHERE DepartmentId = @Id";

            using SqlConnection conn = _connectionFactory.CreateConnection();
            await conn.OpenAsync();

            using SqlCommand cmd = new(sql, conn);
            cmd.Parameters.AddWithValue("@Code", code);
            cmd.Parameters.AddWithValue("@Name", name);
            cmd.Parameters.AddWithValue("@Id", id);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        private static Department MapFromReader(SqlDataReader reader) => new()
        {
            DepartmentId = reader.GetInt32(reader.GetOrdinal("DepartmentId")),
            DepartmentCode = reader.GetString(reader.GetOrdinal("DepartmentCode")),
            DepartmentName = reader.GetString(reader.GetOrdinal("DepartmentName")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            ModifiedAt = reader.IsDBNull(reader.GetOrdinal("ModifiedAt"))
                     ? null
                     : reader.GetDateTime(reader.GetOrdinal("ModifiedAt")),
            IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive"))
        };
    }
}