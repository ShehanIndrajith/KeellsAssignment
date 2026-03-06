using KeellsBackend.DTOs;
using KeellsBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace KeellsBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _departmentService.GetAllDepartmentsAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _departmentService.GetDepartmentByIdAsync(id);
            return result == null ? NotFound(new { Message = "Department not found." }) : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DepartmentCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (success, message, data, inactiveFound) = await _departmentService.CreateDepartmentAsync(dto);

            if (inactiveFound != null)
                return Conflict(new { Message = message, InactiveFound = inactiveFound });

            return success
                ? Ok(new { Message = message, Data = data })
                : BadRequest(new { Message = message });
        }

        [HttpPost("reactivate/{id}")]
        public async Task<IActionResult> Reactivate(int id, [FromBody] DepartmentCreateDto dto)
        {
            var (success, message, data) = await _departmentService.ReactivateDepartmentAsync(id, dto);
            return success
                ? Ok(new { Message = message, Data = data })
                : BadRequest(new { Message = message });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] DepartmentUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (success, message) = await _departmentService.UpdateDepartmentAsync(dto);
            return success ? Ok(new { Message = message })
                           : BadRequest(new { Message = message });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, message) = await _departmentService.DeleteDepartmentAsync(id);
            return success ? Ok(new { Message = message })
                           : BadRequest(new { Message = message });
        }
    }
}