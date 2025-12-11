// Converter Utility
// Converts between different formats

function convertFormat(text, conversionType) {
    try {
        switch (conversionType) {
            case 'json-to-csv':
                return jsonToCSV(text);
            case 'json-to-yaml':
                return jsonToYAML(text);
            case 'yaml-to-json':
                return yamlToJSON(text);
            case 'csv-to-json':
                return csvToJSON(text);
            case 'json-to-sql':
                return jsonToSQL(text);
            case 'md-table-to-json':
                return mdTableToJSON(text);
            default:
                return { converted: null, error: 'Unknown conversion type' };
        }
    } catch (error) {
        return { converted: null, error: error.message };
    }
}

// JSON to CSV
function jsonToCSV(text) {
    try {
        const data = JSON.parse(text);

        // Handle array of objects
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
            const headers = Object.keys(data[0]);
            const csvRows = [];

            // Add headers
            csvRows.push(headers.join(','));

            // Add data rows
            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header];
                    // Escape commas and quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
                csvRows.push(values.join(','));
            });

            return {
                converted: csvRows.join('\n'),
                targetFormat: 'CSV',
                error: null
            };
        } else {
            return {
                converted: null,
                error: 'JSON must be an array of objects for CSV conversion'
            };
        }
    } catch (error) {
        return { converted: null, error: 'Invalid JSON' };
    }
}

// JSON to YAML
function jsonToYAML(text) {
    try {
        const data = JSON.parse(text);
        const yaml = convertToYAML(data, 0);

        return {
            converted: yaml,
            targetFormat: 'YAML',
            error: null
        };
    } catch (error) {
        return { converted: null, error: 'Invalid JSON' };
    }
}

// Helper function to convert object to YAML
function convertToYAML(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    if (Array.isArray(obj)) {
        obj.forEach(item => {
            if (typeof item === 'object' && item !== null) {
                yaml += `${spaces}-\n${convertToYAML(item, indent + 1)}`;
            } else {
                yaml += `${spaces}- ${item}\n`;
            }
        });
    } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
            const value = obj[key];

            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`;
                } else {
                    yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`;
                }
            } else {
                yaml += `${spaces}${key}: ${value}\n`;
            }
        });
    } else {
        yaml += `${spaces}${obj}\n`;
    }

    return yaml;
}

// YAML to JSON
function yamlToJSON(text) {
    try {
        const json = parseYAML(text);
        const converted = JSON.stringify(json, null, 2);

        return {
            converted,
            targetFormat: 'JSON',
            error: null
        };
    } catch (error) {
        return { converted: null, error: 'Invalid YAML: ' + error.message };
    }
}

// Simple YAML parser
function parseYAML(text) {
    const lines = text.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    const result = {};
    const stack = [{ obj: result, indent: -1 }];

    lines.forEach(line => {
        const indent = line.search(/\S/);
        const trimmed = line.trim();

        // Handle list items
        if (trimmed.startsWith('-')) {
            const value = trimmed.substring(1).trim();
            const parent = stack[stack.length - 1].obj;

            if (!Array.isArray(parent)) {
                // Convert parent to array
                const key = Object.keys(parent).pop();
                parent[key] = [];
            }

            if (value.includes(':')) {
                const obj = {};
                const [k, v] = value.split(':').map(s => s.trim());
                obj[k] = parseValue(v);
                parent[parent.length] = obj;
            } else {
                parent.push(parseValue(value));
            }
        }
        // Handle key-value pairs
        else if (trimmed.includes(':')) {
            const [key, ...valueParts] = trimmed.split(':');
            const value = valueParts.join(':').trim();

            // Pop stack to correct indent level
            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }

            const parent = stack[stack.length - 1].obj;

            if (value === '') {
                // Nested object
                parent[key.trim()] = {};
                stack.push({ obj: parent[key.trim()], indent });
            } else {
                parent[key.trim()] = parseValue(value);
            }
        }
    });

    return result;
}

// Parse YAML value
function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (!isNaN(value) && value !== '') return Number(value);
    return value;
}

// CSV to JSON
function csvToJSON(text) {
    try {
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return { converted: null, error: 'CSV must have at least a header and one data row' };
        }

        const headers = parseCSVLine(lines[0]);
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const obj = {};

            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });

            result.push(obj);
        }

        return {
            converted: JSON.stringify(result, null, 2),
            targetFormat: 'JSON',
            error: null
        };
    } catch (error) {
        return { converted: null, error: 'Invalid CSV' };
    }
}

// Parse CSV line (handles quoted values)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// JSON to SQL INSERT statements
function jsonToSQL(text) {
    try {
        const data = JSON.parse(text);

        if (!Array.isArray(data) || data.length === 0) {
            return { converted: null, error: 'JSON must be a non-empty array for SQL conversion' };
        }

        const tableName = 'table_name';
        const columns = Object.keys(data[0]);
        const sqlStatements = [];

        data.forEach(row => {
            const values = columns.map(col => {
                const value = row[col];
                if (typeof value === 'string') {
                    return `'${value.replace(/'/g, "''")}'`;
                } else if (value === null || value === undefined) {
                    return 'NULL';
                }
                return value;
            });

            sqlStatements.push(
                `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`
            );
        });

        return {
            converted: sqlStatements.join('\n'),
            targetFormat: 'SQL',
            error: null
        };
    } catch (error) {
        return { converted: null, error: 'Invalid JSON' };
    }
}

// Markdown Table to JSON
function mdTableToJSON(text) {
    try {
        const lines = text.split('\n').filter(line => line.trim().startsWith('|'));

        if (lines.length < 3) {
            return { converted: null, error: 'Markdown table must have at least header, separator, and one data row' };
        }

        // Parse header
        const headers = lines[0]
            .split('|')
            .map(h => h.trim())
            .filter(h => h.length > 0);

        // Skip separator line (lines[1])

        // Parse data rows
        const result = [];
        for (let i = 2; i < lines.length; i++) {
            const values = lines[i]
                .split('|')
                .map(v => v.trim())
                .filter((v, idx) => idx > 0 && idx <= headers.length);

            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });

            result.push(obj);
        }

        return {
            converted: JSON.stringify(result, null, 2),
            targetFormat: 'JSON',
            error: null
        };
    } catch (error) {
        return { converted: null, error: 'Invalid Markdown table' };
    }
}
