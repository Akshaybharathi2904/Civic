export class Permission {
  constructor({
    id = `perm_${Date.now()}`,
    code,
    name,
    category = 'GENERAL',
  }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.category = category;
  }
}

export default Permission;
