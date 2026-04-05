const { ROLES } = require("../config/constants");

function isBankingRole(role) {
  return role === ROLES.USER || role === ROLES.STUDENT || role === ROLES.ADMIN;
}

function isStudentRole(role) {
  return role === ROLES.USER || role === ROLES.STUDENT;
}

module.exports = { isBankingRole, isStudentRole, ROLES };
