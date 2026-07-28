import crypto from 'crypto';

export class PasswordEncoderContract {
  async encode(rawPassword) { throw new Error('PasswordEncoderContract.encode must be implemented.'); }
  async matches(rawPassword, encodedPassword) { throw new Error('PasswordEncoderContract.matches must be implemented.'); }
}

export class BCryptPasswordEncoder extends PasswordEncoderContract {
  async encode(rawPassword) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(rawPassword, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  async matches(rawPassword, encodedPassword) {
    if (!encodedPassword || !encodedPassword.includes(':')) return false;
    const [salt, originalHash] = encodedPassword.split(':');
    const hash = crypto.pbkdf2Sync(rawPassword, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }
}

export default { PasswordEncoderContract, BCryptPasswordEncoder };
