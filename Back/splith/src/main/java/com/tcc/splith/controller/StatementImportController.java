package com.tcc.splith.controller;

import com.tcc.splith.config.JWTUserData;
import com.tcc.splith.entity.User;
import com.tcc.splith.repository.UserRepository;
import com.tcc.splith.service.StatementImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/statement")
public class StatementImportController {

    private final StatementImportService importService;
    private final UserRepository userRepository;

    // Injetando o Maestro e o Repositório de Usuários
    public StatementImportController(StatementImportService importService, UserRepository userRepository) {
        this.importService = importService;
        this.userRepository = userRepository;
    }

    @PostMapping("/import")
    public ResponseEntity<String> importFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("bankCode") String bankCode,
            @RequestParam("groupName") String groupName) { // <- Novo parâmetro!

        try {
            // 1. Descobre quem é o usuário logado através do Token JWT
            JWTUserData loggedUser = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = userRepository.findById(loggedUser.userId()).orElseThrow();

            // 2. Repassa a bola para o Maestro cuidar de tudo, agora passando o usuário e o grupo
            importService.importStatement(file, bankCode, user, groupName);

            return ResponseEntity.ok("Arquivo lido e transações salvas com sucesso no banco de dados!");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erro de validação: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro interno ao processar o arquivo: " + e.getMessage());
        }
    }
}