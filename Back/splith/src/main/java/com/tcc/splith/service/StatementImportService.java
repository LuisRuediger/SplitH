package com.tcc.splith.service;

import com.tcc.splith.dto.statement.ParsedTransactionDTO;
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

    // Injetamos as Estratégias e o Repositório de Transações
    public StatementImportService(List<StatementProcessorStrategy> strategies, TransactionRepository transactionRepository) {
        this.strategies = strategies;
        this.transactionRepository = transactionRepository;
    }

    public void importStatement(MultipartFile file, String bankCode, User user, String groupName) {

        // 1. Acha o leitor correto (ex: Nubank)
        StatementProcessorStrategy processor = strategies.stream()
                .filter(strategy -> strategy.supports(bankCode))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Formato de banco não suportado: " + bankCode));

        // 2. Extrai os dados do arquivo para a memória
        List<ParsedTransactionDTO> dtos = processor.process(file);

        // 3. Mapeia os DTOs temporários para Entidades reais do banco
        List<Transaction> transactionsToSave = dtos.stream().map(dto -> {
            Transaction novaDespesa = new Transaction();
            novaDespesa.setDate(dto.getDate());
            novaDespesa.setDescription(dto.getDescription());
            novaDespesa.setAmount(dto.getAmount());

            // Adicionando o Contexto
            novaDespesa.setUser(user);
            novaDespesa.setGroupName(groupName);

            // Valores padrão para importação
            novaDespesa.setAccount("Nubank");
            novaDespesa.setCategory("Importado");
            novaDespesa.setType("DESPESA");

            return novaDespesa;
        }).collect(Collectors.toList());

        // 4. Salva tudo de uma vez no PostgreSQL!
        transactionRepository.saveAll(transactionsToSave);

        System.out.println(transactionsToSave.size() + " transações foram salvas no banco com sucesso!");
    }
}