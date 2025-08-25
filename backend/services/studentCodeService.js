const { pool } = require('../config/database');

class StudentCodeService {
  // Este servicio ya no genera códigos, solo verifica si existen
  // Los códigos se asignan desde otra API durante el matching
  
  // Verificar si un código ya existe
  static async codeExists(code) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM estudiantes_odontologia WHERE codigo_estudiante = ?',
        [code]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error verificando código:', error);
      return false;
    }
  }
  
  // Obtener el siguiente número disponible para códigos (solo para referencia)
  static async getNextAvailableNumber() {
    const currentYear = new Date().getFullYear();
    const baseCode = `EST-${currentYear}-`;
    
    try {
      const [rows] = await pool.execute(
        'SELECT codigo_estudiante FROM estudiantes_odontologia WHERE codigo_estudiante LIKE ? ORDER BY id DESC LIMIT 1',
        [`${baseCode}%`]
      );
      
      let nextNumber = 1;
      
      if (rows.length > 0) {
        const lastCode = rows[0].codigo_estudiante;
        const lastNumber = parseInt(lastCode.split('-')[2]);
        nextNumber = lastNumber + 1;
      }
      
      return nextNumber;
    } catch (error) {
      console.error('Error obteniendo siguiente número:', error);
      return 1;
    }
  }
}

module.exports = StudentCodeService;
