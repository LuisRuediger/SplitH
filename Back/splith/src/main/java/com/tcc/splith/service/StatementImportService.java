package com.tcc.splith.service;

import com.tcc.splith.entity.Transaction;
import com.tcc.splith.entity.User;
import com.tcc.splith.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class StatementImportService {

    private final TransactionRepository transactionRepository;

    public StatementImportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public void processFile(MultipartFile file, User user) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null) throw new Exception("Arquivo sem nome.");

        filename = filename.toLowerCase();

        if (filename.endsWith(".csv")) {
            processCsv(file, user);
        } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
            processExcel(file, user);
        } else if (filename.endsWith(".ofx")) {
            processOfx(file, user);
        } else {
            throw new Exception("Formato de arquivo não suportado pelo servidor.");
        }
    }

    private void processCsv(MultipartFile file, User user) throws Exception {
        List<Transaction> transactionsToSave = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            reader.readLine(); // Pula o cabeçalho

            while ((line = reader.readLine()) != null) {
                String[] data = line.split(","); // Supondo separação por vírgula

                if (data.length >= 6) {
                    Transaction t = new Transaction();
                    t.setUser(user);
                    t.setDate(LocalDate.parse(data[0].trim(), formatter));
                    t.setDescription(data[1].trim());
                    t.setCategory(data[2].trim());
                    t.setAccount(data[3].trim());
                    t.setType(data[4].trim().toUpperCase());
                    t.setAmount(new BigDecimal(data[5].trim()));
                    t.setGroupName("Pessoal"); // Por padrão, entra como despesa pessoal

                    transactionsToSave.add(t);
                }
            }
            transactionRepository.saveAll(transactionsToSave);
        }
    }

    private void processExcel(MultipartFile file, User user) throws Exception {
        // TODO: Implementaremos na próxima etapa usando a biblioteca Apache POI
        throw new Exception("Importação de Excel ainda em desenvolvimento.");
    }

    private void processOfx(MultipartFile file, User user) throws Exception {
        // TODO: Implementaremos na próxima etapa usando a biblioteca OFX4J
        throw new Exception("Importação de OFX ainda em desenvolvimento.");
    }
}