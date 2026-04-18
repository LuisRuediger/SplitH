package com.tcc.splith.service.strategy;

import com.tcc.splith.dto.statement.ParsedTransactionDTO;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class NubankCsvProcessor implements StatementProcessorStrategy {

    // Mantemos os dois formatadores prontos para uso
    private static final DateTimeFormatter FORMAT_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FORMAT_US = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public boolean supports(String bankCode) {
        return "NUBANK_CSV".equalsIgnoreCase(bankCode);
    }

    @Override
    public List<ParsedTransactionDTO> process(MultipartFile file) {
        List<ParsedTransactionDTO> transactions = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean isFirstLine = true;

            while ((line = reader.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                String[] columns = line.split(",");

                if (columns.length >= 3) {
                    String dateStr = columns[0].trim();
                    LocalDate date;

                    // Estratégia resiliente para ler a data
                    if (dateStr.contains("/")) {
                        date = LocalDate.parse(dateStr, FORMAT_BR); // Tenta 25/10/2023
                    } else {
                        date = LocalDate.parse(dateStr, FORMAT_US); // Tenta 2025-10-04
                    }

                    String description = columns[1].trim();

                    // Tratamento reforçado para o valor numérico
                    String amountStr = columns[2].replace("\"", "").trim();
                    BigDecimal amount = new BigDecimal(amountStr);

                    transactions.add(new ParsedTransactionDTO(date, description, amount));
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar o arquivo CSV do Nubank: " + e.getMessage(), e);
        }

        return transactions;
    }
}