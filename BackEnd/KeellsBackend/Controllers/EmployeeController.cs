using KeellsBackend.DTOs;
using KeellsBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace KeellsBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _employeeService.GetAllEmployeesAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _employeeService.GetEmployeeByIdAsync(id);
            return result == null ? NotFound(new { Message = "Employee not found." }) : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmployeeCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (success, message, data) = await _employeeService.CreateEmployeeAsync(dto);
            return success ? Ok(new { Message = message, Data = data })
                           : BadRequest(new { Message = message });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] EmployeeUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (success, message) = await _employeeService.UpdateEmployeeAsync(dto);
            return success ? Ok(new { Message = message })
                           : BadRequest(new { Message = message });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, message) = await _employeeService.DeleteEmployeeAsync(id);
            return success ? Ok(new { Message = message })
                           : BadRequest(new { Message = message });
        }
    }
}