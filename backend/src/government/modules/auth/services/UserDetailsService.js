import { GovernmentUserAuth } from '../models/GovernmentUserAuth.js';
import { BCryptPasswordEncoder } from './PasswordEncoder.js';

export class UserDetailsServiceContract {
  async loadUserByEmail(email) { throw new Error('UserDetailsServiceContract.loadUserByEmail must be implemented.'); }
  async loadUserById(id) { throw new Error('UserDetailsServiceContract.loadUserById must be implemented.'); }
}

export class UserDetailsService extends UserDetailsServiceContract {
  constructor(encoder = new BCryptPasswordEncoder()) {
    super();
    this.encoder = encoder;
    this.usersByEmail = new Map();
    this.usersById = new Map();
    this.initialized = false;
  }

  async initializeDefaults() {
    if (this.initialized) return;
    const defaultPasswordHash = await this.encoder.encode('Password@123');

    const defaultUsers = [
      new GovernmentUserAuth({ id: 'usr_gov_01', username: 'admin.state', email: 'admin.state@tn.gov.in', passwordHash: defaultPasswordHash, role: 'STATE_ADMIN' }),
      new GovernmentUserAuth({ id: 'usr_gov_02', username: 'admin.district', email: 'admin.district@coimbatore.gov.in', passwordHash: defaultPasswordHash, role: 'DISTRICT_ADMIN' }),
      new GovernmentUserAuth({ id: 'usr_gov_03', username: 'commissioner.cbe', email: 'commissioner@coimbatore.gov.in', passwordHash: defaultPasswordHash, role: 'MUNICIPAL_COMMISSIONER' }),
      new GovernmentUserAuth({ id: 'usr_gov_04', username: 'supervisor.pwd', email: 'supervisor.pwd@coimbatore.gov.in', passwordHash: defaultPasswordHash, role: 'DEPARTMENT_SUPERVISOR', departmentId: 'PWD' }),
      new GovernmentUserAuth({ id: 'usr_gov_05', username: 'officer.pwd', email: 'officer.pwd@coimbatore.gov.in', passwordHash: defaultPasswordHash, role: 'FIELD_OFFICER', departmentId: 'PWD' }),
      new GovernmentUserAuth({ id: 'usr_gov_06', username: 'worker.ground', email: 'worker.ground@coimbatore.gov.in', passwordHash: defaultPasswordHash, role: 'GROUND_WORKER', departmentId: 'PWD' }),
    ];

    defaultUsers.forEach(u => {
      this.usersByEmail.set(u.email.toLowerCase(), u);
      this.usersById.set(u.id, u);
    });

    this.initialized = true;
  }

  async loadUserByEmail(email) {
    await this.initializeDefaults();
    return this.usersByEmail.get((email || '').toLowerCase().trim()) || null;
  }

  async loadUserById(id) {
    await this.initializeDefaults();
    return this.usersById.get(id) || null;
  }
}

export default { UserDetailsServiceContract, UserDetailsService };
