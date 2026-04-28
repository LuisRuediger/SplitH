package com.tcc.splith.service;

import com.tcc.splith.controller.TransactionController;
import com.tcc.splith.dto.TransactionRequest;
import com.tcc.splith.entity.Group;
import com.tcc.splith.entity.Transaction;
import com.tcc.splith.entity.TransactionSplit;
import com.tcc.splith.entity.User;
import com.tcc.splith.repository.GroupRepository;
import com.tcc.splith.repository.TransactionRepository;
import com.tcc.splith.repository.TransactionSplitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionSplitRepository splitRepository;
    private final GroupRepository groupRepository;

    public TransactionService(TransactionRepository transactionRepository, TransactionSplitRepository splitRepository, GroupRepository groupRepository) {
        this.transactionRepository = transactionRepository;
        this.splitRepository = splitRepository;
        this.groupRepository = groupRepository;
    }

    @Transactional
    public Transaction createAndSplitTransaction(TransactionRequest request, User loggedUser) {
        Transaction t = new Transaction();
        t.setUser(loggedUser);
        t.setDescription(request.description());
        t.setAmount(request.amount());
        t.setDate(request.date());
        t.setCategory(request.category());
        t.setAccount(request.account());
        t.setType(request.type());

        Group group = null;
        if (request.groupName() != null && !request.groupName().equalsIgnoreCase("Pessoal")) {
            group = groupRepository.findByName(request.groupName()).orElse(null);
            t.setGroup(group);
        }

        Transaction savedTransaction = transactionRepository.save(t);

        // Se houver grupo e membros, calcula o rateio (Split)
        if (group != null && !group.getMembers().isEmpty()) {
            BigDecimal totalMembers = new BigDecimal(group.getMembers().size());
            BigDecimal amountPerPerson = request.amount().divide(totalMembers, 2, RoundingMode.HALF_UP);

            for (User member : group.getMembers()) {
                TransactionSplit split = new TransactionSplit();
                split.setTransaction(savedTransaction);
                split.setUser(member);
                split.setAmountOwed(amountPerPerson);
                splitRepository.save(split);
            }
        }

        return savedTransaction;
    }
}