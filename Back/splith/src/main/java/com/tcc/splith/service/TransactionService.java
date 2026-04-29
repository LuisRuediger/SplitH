package com.tcc.splith.service;

import com.tcc.splith.dto.TransactionRequest;
import com.tcc.splith.entity.Group;
import com.tcc.splith.entity.GroupMember;
import com.tcc.splith.entity.Transaction;
import com.tcc.splith.entity.TransactionSplit;
import com.tcc.splith.entity.User;
import com.tcc.splith.repository.GroupMemberRepository;
import com.tcc.splith.repository.GroupRepository;
import com.tcc.splith.repository.TransactionRepository;
import com.tcc.splith.repository.TransactionSplitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionSplitRepository splitRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    public TransactionService(TransactionRepository transactionRepository, TransactionSplitRepository splitRepository, GroupRepository groupRepository, GroupMemberRepository groupMemberRepository) {
        this.transactionRepository = transactionRepository;
        this.splitRepository = splitRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
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

        if (group != null) {
            List<GroupMember> memberships = groupMemberRepository.findByGroupId(group.getId());
            if (!memberships.isEmpty()) {
                BigDecimal totalMembers = new BigDecimal(memberships.size());
                BigDecimal amountPerPerson = request.amount().divide(totalMembers, 2, RoundingMode.HALF_UP);
                for (GroupMember membership : memberships) {
                    TransactionSplit split = new TransactionSplit();
                    split.setTransaction(savedTransaction);
                    split.setUser(membership.getUser());
                    split.setAmountOwed(amountPerPerson);
                    splitRepository.save(split);
                }
            }
        }

        return savedTransaction;
    }
}
