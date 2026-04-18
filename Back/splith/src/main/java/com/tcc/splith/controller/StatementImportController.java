package com.tcc.splith.controller;

import com.tcc.splith.service.StatementImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/statement")
public class StatementImportController {

    private final StatementImportService importService;

    // Injetando o nosso Maestro
    public StatementImportController(StatementImportService importService) {
        this.importService = importService;
    }

    /**
     * Endpoint para receber o upload do arquivo de extrato.
     * Rota completa: POST http://localhost:8080/api/statement/import
     */
    @PostMapping("/import")
    public ResponseEntity<String> importFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("bankCode") String bankCode) {

        try {
            // Repassa a bola para o Maestro cuidar de tudo
            importService.importStatement(file, bankCode);

            return ResponseEntity.ok("Arquivo lido e processado com sucesso! Verifique o console do Spring.");

        } catch (IllegalArgumentException e) {
            // Se o usuário mandar um banco que não existe (Ex: "SANTANDER")
            return ResponseEntity.badRequest().body("Erro de validação: " + e.getMessage());

        } catch (Exception e) {
            // Se o arquivo estiver corrompido ou der erro na leitura
            return ResponseEntity.internalServerError().body("Erro interno ao processar o arquivo: " + e.getMessage());
        }
    }
}