package com.tcc.splith.controller;

import com.tcc.splith.config.JWTUserData;
import com.tcc.splith.entity.Transaction;
import com.tcc.splith.entity.User;
import com.tcc.splith.repository.TransactionRepository;
import com.tcc.splith.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.tcc.splith.service.StatementImportService;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;


    public TransactionController(TransactionRepository transactionRepository, UserRepository userRepository, StatementImportService importService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    // Criamos um Record interno para receber os dados do Angular
    public record TransactionRequest(String description, BigDecimal amount, LocalDate date, String category,
                                     String account, String groupName, String type) {
    }

    @GetMapping("/group/{groupName}")
    public ResponseEntity<List<Transaction>> getGroupTransactions(@PathVariable String groupName) {
        List<Transaction> transactions = transactionRepository.findByGroupNameOrderByIdDesc(groupName);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody TransactionRequest request) {
        // Pega os dados do usuário logado via Token JWT
        JWTUserData loggedUser = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(loggedUser.userId()).orElseThrow();

        // Monta a transação e salva
        Transaction t = new Transaction();
        t.setUser(user);
        t.setDescription(request.description());
        t.setAmount(request.amount());
        t.setDate(request.date());
        t.setCategory(request.category());
        t.setAccount(request.account());
        t.setGroupName(request.groupName());
        t.setType(request.type());

        Transaction saved = transactionRepository.save(t);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);


    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getUserTransactions() {
        // 1. Descobre quem é o usuário logado pelo Token
        JWTUserData loggedUser = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(loggedUser.userId()).orElseThrow();

        // 2. Busca no banco só as transações dele
        List<Transaction> transactions = transactionRepository.findByUserOrderByIdDesc(user);

        // 3. Devolve a lista para o Angular
        return ResponseEntity.ok(transactions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody TransactionRequest request) {
        JWTUserData loggedUser = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(loggedUser.userId()).orElseThrow();

        // Busca a transação e garante que ela existe
        Transaction t = transactionRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transação não encontrada"));

        // Regra de segurança: O usuário só pode editar as próprias transações!
        if (!t.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Atualiza os dados
        t.setDescription(request.description());
        t.setAmount(request.amount());
        t.setDate(request.date());
        t.setCategory(request.category());
        t.setAccount(request.account());
        t.setGroupName(request.groupName());
        t.setType(request.type());

        return ResponseEntity.ok(transactionRepository.save(t));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        JWTUserData loggedUser = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(loggedUser.userId()).orElseThrow();

        Transaction t = transactionRepository.findById(id).orElseThrow();

        if (!t.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        transactionRepository.delete(t);
        return ResponseEntity.noContent().build();
    }

}

