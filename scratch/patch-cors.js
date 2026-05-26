const fs = require('fs');
const path = 'C:\\CinePOO\\cine\\src\\main\\java\\com\\cine\\cine\\config\\SecurityConfig.java';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes('corsConfigurationSource')) {
    content = content.replace('http\\n            .csrf(csrf -> csrf.disable())', 'http\\n            .cors(org.springframework.security.config.Customizer.withDefaults())\\n            .csrf(csrf -> csrf.disable())');
    
    // Si el replace falló porque la indentación o los saltos de línea son diferentes:
    if (!content.includes('.cors(')) {
        content = content.replace('.csrf(csrf -> csrf.disable())', '.cors(org.springframework.security.config.Customizer.withDefaults()).csrf(csrf -> csrf.disable())');
    }

    const bean = `
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:4200"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
`;
    // Insert bean just before the last closing brace
    content = content.substring(0, content.lastIndexOf('}')) + bean + '}\n';
    
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched CORS in SecurityConfig.java');
} else {
    console.log('CORS already patched');
}
