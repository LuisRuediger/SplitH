package com.tcc.splith.service;

import com.tcc.splith.dto.statement.ParsedTransactionDTO;
import com.tcc.splith.entity.Group;
import com.tcc.splith.entity.Transaction;
import com.tcc.splith.entity.User;
import com.tcc.splith.repository.TransactionRepository;
import com.tcc.splith.service.strategy.StatementProcessorStrategy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatementImportService {

    private final List<StatementProcessorStrategy> strategies;
    private final TransactionRepository transactionRepository;

    public StatementImportService(List<StatementProcessorStrategy> strategies, TransactionRepository transactionRepository) {
        this.strategies = strategies;
        this.transactionRepository = transactionRepository;
    }

    // 1. Assinatura alterada: 'String groupName' substituído por 'Group group'
    public void importStatement(MultipartFile file, String bankCode, User user, Group group) {

        StatementProcessorStrategy processor = strategies.stream()
                .filter(strategy -> strategy.supports(bankCode))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Formato de banco não suportado: " + bankCode));

        List<ParsedTransactionDTO> dtos = processor.process(file);

        List<Transaction> transactionsToSave = dtos.stream().map(dto -> {
            Transaction novaDespesa = new Transaction();
            novaDespesa.setDate(dto.getDate());
            novaDespesa.setDescription(dto.getDescription());
            novaDespesa.setAmount(dto.getAmount());

            novaDespesa.setUser(user);

            // 2. Correção: passando o objeto Group em vez da String
            novaDespesa.setGroup(group);

            novaDespesa.setAccount("Nubank");
            novaDespesa.setCategory("Importado");
            novaDespesa.setType("DESPESA");

            return novaDespesa;
        }).collect(Collectors.toList());

        transactionRepository.saveAll(transactionsToSave);

        System.out.println(transactionsToSave.size() + " transações foram salvas no banco com sucesso!");
    }
}