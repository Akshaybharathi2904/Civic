export class CreateDepartmentDTO {
  constructor({ name, code, zone = 'Central Zone', contactEmail = '' }) {
    if (!name || !code) throw new Error('CreateDepartmentDTO requires name and code.');
    this.name = name;
    this.code = code;
    this.zone = zone;
    this.contactEmail = contactEmail;
  }
}

export default { CreateDepartmentDTO };
